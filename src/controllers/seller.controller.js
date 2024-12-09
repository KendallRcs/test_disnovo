const prisma = require('../prismaClient');

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
