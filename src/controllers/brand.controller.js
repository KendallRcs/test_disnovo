exports.createBrand = async (req, res) => {
  try {
    const { name } = req.body;
    const newBrand = await prisma.brand.create({
      data: { name },
    });
    res.status(201).json(newBrand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { deletedAt: null },
    });
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedBrand = await prisma.brand.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
      },
    });
    res.status(200).json(updatedBrand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.brand.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
