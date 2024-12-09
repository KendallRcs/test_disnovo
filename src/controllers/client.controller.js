const multer = require('multer');
const xlsx = require('xlsx');

exports.createClient = async (req, res) => {
  try {
    const { name, segmentId } = req.body;
    const newClient = await prisma.client.create({
      data: { name, segmentId },
    });
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { deletedAt: null },
      include: { segment: true },
    });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, segmentId } = req.body;

    const updatedClient = await prisma.client.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(segmentId && { segmentId }),
      },
    });
    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.client.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const upload = multer({ storage: multer.memoryStorage() }).single('file');

exports.importClientsFromExcel = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'Error uploading file' });
    }

    try {
      // Leyendo archivo Excel
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      const results = [];
      for (const row of data) {
        const { Cliente, Segmento } = row;

        // Validar y buscar/crear segmento
        let segment = await prisma.segment.findFirst({
          where: { name: { equals: Segmento, mode: 'insensitive' } },
        });

        if (!segment) {
          segment = await prisma.segment.create({
            data: { name: Segmento },
          });
        }

        // Validar cliente
        let client = await prisma.client.findFirst({
          where: { name: { equals: Cliente, mode: 'insensitive' } },
        });

        if (!client) {
          // Si el cliente no existe, se crea con el segmento
          client = await prisma.client.create({
            data: {
              name: Cliente,
              segmentId: segment.id,
            },
          });
        } else if (client.segmentId !== segment.id) {
          // Si el cliente existe pero tiene un segmento distinto, se actualiza
          client = await prisma.client.update({
            where: { id: client.id },
            data: {
              segmentId: segment.id,
            },
          });
        }

        results.push({ client, segment });
      }

      res.status(201).json({ message: 'Clients imported successfully', results });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
