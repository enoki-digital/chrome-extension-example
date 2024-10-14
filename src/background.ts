import {addListener} from "./messaging";

let language = "en";

(() => {
    addListener(async (message) => {
            const getDefinition = async () => {
                const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
                const tabId = tab.id as number;
                const injection = await chrome.scripting.executeScript({
                    target: {tabId},
                    files: ["dist/content.js"],
                });

                const word = injection[0].result as string;
                const link = `https://${language}.wikipedia.org/wiki/${word}`
                const response = await fetch(link)
                const content = await response.text()
                return { content, link, word };
            }

            if (message.topic == "opened") {
                // type system knows message is OpenedMessageRequest
                const definition = await getDefinition()

                message.sendResponse?.(definition);
            } else if (message.topic == "changeLanguage") {
                // type system knows message is ChangeLanguageRequest
                language = message.language;
                const definition = await getDefinition()

                message.sendResponse?.(definition);
            }
        },
    );
})()
