import RecipeCards from "@/components/recipes/RecipeCards";
import Header from "@/components/Header";
const Recipes = () => {
  return (
    <div className="bg-cookcraft-white h-screen w-screen">
      <Header title="Recipes" />

      <RecipeCards />
    </div>
  );
};

export default Recipes;
