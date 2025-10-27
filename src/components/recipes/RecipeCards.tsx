import RecipeList from "@/data/RecipeList";

const RecipeCards = () => {
  return (
    <div className="flex justify-center gap-15 p-10">
      {RecipeList.map(({ name, ingrediants }, index) => (
        <div
          key={index}
          className="bg-cookcraft-green text-cookcraft-white flex w-1/4 flex-col justify-between rounded-3xl p-5 shadow-lg"
        >
          <div>
            <p className="mb-3 text-3xl font-bold">{name}</p>
            <p className="text-lg whitespace-pre-wrap">{ingrediants}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipeCards;
