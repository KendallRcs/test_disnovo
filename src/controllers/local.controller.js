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
