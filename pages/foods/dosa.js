import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import FoodItem from "../../components/FoodItem";
import FoodItemContainer from "../../components/FoodItemContainer";
import FoodLinks from "../../components/FoodLinks";
import FoodItemData from "../../demoData/foodItem";

const dosa = () => {
  const [dosaItems, setDosaItems] = React.useState([]);
  useEffect(() => {
    if (FoodItemData) {
      const filtered = FoodItemData.filter(
        (item) => item.category.toLowerCase() === "dosa"
      );
      setDosaItems(filtered);
    }
  }, []);
  return (
    <>
      <div className="max-w-6xl mx-auto min-h-[83vh] p-3">
        <FoodLinks />
        <FoodItemContainer>
          {dosaItems.map((item) => {
            return <FoodItem key={item._id} item={item} />;
          })}
        </FoodItemContainer>
      </div>
    </>
  );
};

export default dosa;
