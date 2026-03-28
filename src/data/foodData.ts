export interface FoodItem {
  name: string;
  tags: string[];
}

export const initialFoodData: FoodItem[] = [
  { name: "Cơm tấm", tags: ["bữa sáng", "đồ việt"] },
  { name: "Bún bò", tags: ["ăn sáng", "ăn tối", "thiếu đạm", "ăn no", "đồ việt", "đồ nóng"] },
  { name: "Taco", tags: ["tối", "ăn nhanh"] },
  { name: "Tobokki", tags: ["ăn tối", "thèm cay", "đồ hàn"] },
  { name: "Đồ panda express", tags: ["mì", "cơm", "ăn no"] },
  { name: "Tô trái cây sữa chua", tags: ["ăn nhẹ", "bữa chiều"] },
  { name: "Pokebo", tags: ["ăn no", "đủ chất", "bổ sung rau"] },
  { name: "Tô healthy", tags: ["ăn no", "bổ sung vitamin", "thêm rau"] },
  { name: "Mì ý", tags: ["ăn no", "thèm béo", "hẹn hò"] },
  { name: "Há cảo chiên", tags: ["thèm đồ chiên"] },
  { name: "Há cảo hấp", tags: ["thèm đồ trung"] },
  { name: "Canh bún", tags: ["đồ nóng", "ăn một bữa", "đồ việt"] },
  { name: "Mì sủi cảo", tags: ["đồ trung", "ăn no", "đồ nóng", "ăn 1 bữa"] },
  { name: "Mì udon", tags: ["thèm mỳ", "đồ hàn", "đồ nóng", "ăn 1 bữa"] },
  { name: "Mì ramen", tags: ["đồ nhật", "ăn no", "ăn 1 bữa"] },
  { name: "Cơm gà", tags: ["đồ việt", "ăn no"] },
  { name: "Phở gà", tags: ["đồ nóng", "đồ việt", "ăn no", "kiêng bò", "ăn 1 bữa"] },
  { name: "Phở bò", tags: ["đồ nóng", "đồ việt", "ăn no", "ăn tối", "ăn sáng", "ăn 1 bữa"] },
];
