exports.createMarketer = async (req, res) => {
  try {
    const { name } = req.body;
    const newMarketer = await prisma.marketer.create({
      data: { name },
    });
    res.status(201).json(newMarketer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMarketers = async (req, res) => {
  try {
    const marketers = await prisma.marketer.findMany({
      where: { deletedAt: null },
    });
    res.status(200).json(marketers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMarketer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedMarketer = await prisma.marketer.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
      },
    });
    res.status(200).json(updatedMarketer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMarketer = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.marketer.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
