exports.createAssignment = async (req, res) => {
  try {
    const { sellerId, territoryId, startDate, endDate } = req.body;
    const newAssignment = await prisma.sellerTerritoryAssignment.create({
      data: { sellerId, territoryId, startDate, endDate },
    });
    res.status(201).json(newAssignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const assignments = await prisma.sellerTerritoryAssignment.findMany({
      where: { deletedAt: null },
      include: {
        seller: true,
        territory: true,
      },
    });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { sellerId, territoryId, startDate, endDate } = req.body;

    const updatedAssignment = await prisma.sellerTerritoryAssignment.update({
      where: { id: parseInt(id) },
      data: {
        ...(sellerId && { sellerId }),
        ...(territoryId && { territoryId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
    });
    res.status(200).json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.sellerTerritoryAssignment.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
