import CrawlerService from "@/services/crawler.service";

const ctx: Worker = self as any;

ctx.onmessage = async (e) => {
  const { data } = e;
  const [boardConfigs, player, virtualCellCollection, startingEmptyCells] = data;

  const crawler = new CrawlerService(boardConfigs, player);

  const nextMove = await crawler.launch(
    virtualCellCollection,
    startingEmptyCells
  );

  ctx.postMessage(nextMove);
};
