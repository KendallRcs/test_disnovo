exports.createTerritory = async (req, res) => {
  try {
    const { name } = req.body;
    const newTerritory = await prisma.territory.create({
      data: { name },
    });
    res.status(201).json(newTerritory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTerritories = async (req, res) => {
  try {
    const territories = await prisma.territory.findMany({
      where: { deletedAt: null },
    });
    res.status(200).json(territories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTerritory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedTerritory = await prisma.territory.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
      },
    });
    res.status(200).json(updatedTerritory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTerritory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.territory.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
