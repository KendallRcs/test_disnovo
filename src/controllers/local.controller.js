const multer = require('multer');
const xlsx = require('xlsx');

exports.createLocal = async (req, res) => {
  try {
    const { name, clientId, territoryId } = req.body;
    const newLocal = await prisma.local.create({
      data: { name, clientId, territoryId },
    });
    res.status(201).json(newLocal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLocals = async (req, res) => {
  try {
    const locals = await prisma.local.findMany({
      where: { deletedAt: null },
      include: { client: true, territory: true },
    });
    res.status(200).json(locals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLocal = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, clientId, territoryId } = req.body;

    const updatedLocal = await prisma.local.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(clientId && { clientId }),
        ...(territoryId && { territoryId }),
      },
    });
    res.status(200).json(updatedLocal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteLocal = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.local.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const upload = multer({ storage: multer.memoryStorage() }).single('file');

exports.importLocalsFromExcel = async (req, res) => {
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
        const { Local, Cliente, Territorio } = row;

        //Validar clientye
        let client = await prisma.client.findFirst({
          where: { name: { equals: Cliente, mode: 'insensitive' } },
        });

        if (!client) {
          client = await prisma.client.create({
            data: { name: Cliente },
          });
        }

        //Validar territorio
        let territory = await prisma.territory.findFirst({
          where: { name: { equals: Territorio, mode: 'insensitive' } },
        });

        if (!territory) {
          territory = await prisma.territory.create({
            data: { name: Territorio },
          });
        }

        //Validar local
        let local = await prisma.local.findFirst({
          where: { name: { equals: Local, mode: 'insensitive' } },
        });

        if (!local) {
          //Si no existre, crear el local
          local = await prisma.local.create({
            data: {
              name: Local,
              clientId: client.id,
              territoryId: territory.id,
            },
          });
        } else if (local.clientId !== client.id || local.territoryId !== territory.id) {
          //Si existe pero cliente o territorio son distintos, actualizar
          local = await prisma.local.update({
            where: { id: local.id },
            data: {
              clientId: client.id,
              territoryId: territory.id,
            },
          });
        }

        results.push({ local, client, territory });
      }

      res.status(201).json({ message: 'Locals imported successfully', results });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
