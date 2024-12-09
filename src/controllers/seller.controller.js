const multer = require('multer');
const xlsx = require('xlsx');

exports.createSeller = async (req, res) => {
  try {
    const { name } = req.body;
    const newSeller = await prisma.seller.create({
      data: { name },
    });
    res.status(201).json(newSeller);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSellers = async (req, res) => {
  try {
    const sellers = await prisma.seller.findMany({
      where: { deletedAt: null },
    });
    res.status(200).json(sellers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedSeller = await prisma.seller.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
      },
    });
    res.status(200).json(updatedSeller);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.seller.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const upload = multer({ storage: multer.memoryStorage() }).single('file');

exports.importSellersFromExcel = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'Error uploading file' });
    }

    try {
      //Leyendo archivo Excel
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      const results = [];
      for (const row of data) {
        const { Vendedor, Territorio } = row;

        //Validar vendedopr
        let seller = await prisma.seller.findFirst({
          where: { name: { equals: Vendedor, mode: 'insensitive' } },
        });

        if (!seller) {
          seller = await prisma.seller.create({
            data: { name: Vendedor },
          });
        }

        //Splitear territorios
        const territories = Territorio.split(/y|,/).map((t) => t.trim());
        for (const territoryName of territories) {
          //Validar territorio
          let territory = await prisma.territory.findFirst({
            where: { name: { equals: territoryName, mode: 'insensitive' } },
          });

          if (!territory) {
            territory = await prisma.territory.create({
              data: { name: territoryName },
            });
          }

          //Validar si el territorio está asignado al vendedor de la fila
          const existingAssignmentForSeller = await prisma.sellerTerritoryAssignment.findFirst({
            where: {
              sellerId: seller.id,
              territoryId: territory.id,
              endDate: null,
            },
          });

          if (!existingAssignmentForSeller) {
            //Validar si el territorio está asignado a otro vendedor
            const existingAssignmentForAnotherSeller = await prisma.sellerTerritoryAssignment.findFirst({
              where: {
                territoryId: territory.id,
                endDate: null,
              },
            });

            //Si está asignado a otro vendedor, actualizar el endDate del vendedor anterior
            if (existingAssignmentForAnotherSeller) {
              await prisma.sellerTerritoryAssignment.update({
                where: { id: existingAssignmentForAnotherSeller.id },
                data: { endDate: new Date() },
              });
            }

            //Asignar el territorio al vendedor actual
            await prisma.sellerTerritoryAssignment.create({
              data: {
                sellerId: seller.id,
                territoryId: territory.id,
                startDate: new Date(),
              },
            });
          }
        }

        results.push({ seller, territories });
      }

      res.status(201).json({ message: 'Sellers imported successfully', results });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};