import {MessageResponse, sendMessage} from "./messaging";

(async() => {
  const report = document.getElementById("report") as HTMLDivElement;

  const reset = () => {
    report.innerText = "Waiting..."
  }

  const updateDefinition = (result: { content: string, link: string, word?: string }) => {
    report.innerText = ""

    if(result.word){
      const wordElement = document.getElementById("word") as HTMLSpanElement;
      wordElement.innerText = result.word;
    }

    const link = document.createElement("a");
    link.innerText = "From Wikipedia"
    link.href = result.link
    link.target = "_blank"
    report.appendChild(link)

    const virtualDocument = new DOMParser().parseFromString(result.content, "text/html");

    const firstParagraph = Array.from(virtualDocument.querySelectorAll("p"))
        .find(p => p.innerText.trim() !== "") as HTMLParagraphElement;

    const p = document.createElement("p");
    p.innerText = firstParagraph.innerText;
    report.appendChild(p);
  }

  const enButton = document.getElementById("language-en") as HTMLButtonElement;
  const esButton = document.getElementById("language-es") as HTMLButtonElement;
  const frButton = document.getElementById("language-fr") as HTMLButtonElement;

  const reloadView = async (broadcast: () => Promise<MessageResponse>) => {
    reset();
    const result = await broadcast();
    updateDefinition(result);
  }

  enButton.addEventListener("click", () => {
    reloadView(() => sendMessage({ topic: "changeLanguage", language: "en" }));
  });

  esButton.addEventListener("click", () => {
    reloadView(() => sendMessage({ topic: "changeLanguage", language: "es" }));
  });

  frButton.addEventListener("click", () => {
    reloadView(() => sendMessage({ topic: "changeLanguage", language: "fr" }));
  });

  await reloadView(() => sendMessage({ topic: "opened" }));
})()
