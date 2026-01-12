import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import FoodItem from "../../components/FoodItem";
import FoodItemContainer from "../../components/FoodItemContainer";
import FoodLinks from "../../components/FoodLinks";
import { fetchFoods } from "../../redux/slices/foodSlice";
import FoodItemData from "../../demoData/foodItem";

const northIndian = () => {
  const [northItems, setNorthIndianItems] = React.useState([]);
  useEffect(() => {
    if (FoodItemData) {
      const filtered = FoodItemData.filter(
        (item) => item.category.toLowerCase() === "north indian"
      );
      setNorthIndianItems(filtered);
    } 
  }, []);
  return (
    <>
      <div className="max-w-6xl mx-auto min-h-[83vh] p-3">
        <FoodLinks />
        <FoodItemContainer>
          {northItems.map((item) => {
            return <FoodItem key={item._id} item={item} />;
          })}
        </FoodItemContainer>
      </div>
    </>
  );
};

export default northIndian;
