exports.createSale = async (req, res) => {
  try {
    const { date, productId, brandId, clientId, localId, sellerId, price, quantity, totalAmount } = req.body;
    const newSale = await prisma.sale.create({
      data: { date, productId, brandId, clientId, localId, sellerId, price, quantity, totalAmount },
    });
    res.status(201).json(newSale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      where: { deletedAt: null },
      include: { product: true, brand: true, client: true, local: true, seller: true },
    });
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, productId, brandId, clientId, localId, sellerId, price, quantity, totalAmount } = req.body;

    const updatedSale = await prisma.sale.update({
      where: { id: parseInt(id) },
      data: {
        ...(date && { date }),
        ...(productId && { productId }),
        ...(brandId && { brandId }),
        ...(clientId && { clientId }),
        ...(localId && { localId }),
        ...(sellerId && { sellerId }),
        ...(price && { price }),
        ...(quantity && { quantity }),
        ...(totalAmount && { totalAmount }),
      },
    });
    res.status(200).json(updatedSale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.sale.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
