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
