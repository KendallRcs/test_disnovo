exports.createSegment = async (req, res) => {
  try {
    const { name } = req.body;
    const newSegment = await prisma.segment.create({
      data: { name },
    });
    res.status(201).json(newSegment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSegments = async (req, res) => {
  try {
    const segments = await prisma.segment.findMany({
      where: { deletedAt: null },
    });
    res.status(200).json(segments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSegment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedSegment = await prisma.segment.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
      },
    });
    res.status(200).json(updatedSegment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSegment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.segment.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
