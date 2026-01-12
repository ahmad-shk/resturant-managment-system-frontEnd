import React, { useState, useEffect } from "react";
import FoodItem from "../../components/FoodItem"; 
import FoodItemContainer from "../../components/FoodItemContainer";
import FoodLinks from "../../components/FoodLinks";
import FoodItemData from "../../demoData/foodItem.js"; // Ab yeh sahi array layega

const ChinesePage = () => {
  // Filtered data ko state mein rakhen taake error na aaye
  const [chineseItems, setChineseItems] = useState([]);

  useEffect(() => {
    if (FoodItemData) {
      const filtered = FoodItemData.filter(
        (item) => item.category.toLowerCase() === "chinese"
      );
      setChineseItems(filtered);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto min-h-[83vh] p-3">
      <FoodLinks />
      <FoodItemContainer>
        {chineseItems.map((item, index) => (
          <FoodItem key={item._id || index} item={item} />
        ))}
      </FoodItemContainer>
    </div>
  );
};

export default ChinesePage;