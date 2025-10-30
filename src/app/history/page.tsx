import HistoryCards from "@/components/history/HistoryCards";
import Header from "@/components/Header";
const History = () => {
  return (
    <div className="bg-cookcraft-white h-screen w-screen">
      <Header title="History" />
      <HistoryCards />
    </div>
  );
};

export default History;
