router.get("/stats", async (req, res) => {
  const totalFood = await Food.countDocuments();
  const accepted = await Food.countDocuments({ status: "Accepted" });

  res.json({
    totalDonations: totalFood,
    mealsServed: accepted * 10,
    foodSavedKg: accepted * 5
  });
});
