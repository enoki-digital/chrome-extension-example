type Preview = { content: string, link: string }

// Inputs and outputs for "opened" message
export type OpenedMessageResponse = Preview & { word: string };
export type OpenedMessageRequest = {
  topic: "opened"
  sendResponse?: (params: OpenedMessageResponse) => void;
};

// Inputs and outputs for "changeLanguage" message
export type ChangeLanguageResponse = Preview;
export type ChangeLanguageRequest = {
  topic: "changeLanguage";
  language: string,
  sendResponse?: (params: ChangeLanguageResponse) => void;
};

// Union type for all messages
export type MessageRequest =
  | OpenedMessageRequest
  | ChangeLanguageRequest;

type Callback = (message: MessageRequest) => void;

// addListener wrapper. This includes some logging to help track the flow of messages in the browser
export const addListener = (callback: Callback) => {
  chrome.runtime.onMessage.addListener(
    (message: MessageRequest, _sender, sendResponse) => {
      console.log("message received", message);

      // Attach sendResponse at runtime. This is why sendResponse is optional, so you should nullguard it
      message.sendResponse = (params: unknown) => {
        console.log("sending response", params);
        sendResponse(params);
      };

      callback(message);

      return true;
    },
  );
};

// Handle requests that may need to be sent to a tab. Not required, but useful if you need to send messages to tabs
type RequestParameters = MessageRequest | ({ tabId: number } & MessageRequest);

// Union for all message responses
export type MessageResponse =
  | OpenedMessageResponse
  | ChangeLanguageResponse;

// Signature overloads for message inputs and outputs. If you add a new message type, be sure to add an overload here
export async function sendMessage(
  input: OpenedMessageRequest,
): Promise<OpenedMessageResponse>;
export async function sendMessage(
  input: ChangeLanguageRequest,
): Promise<ChangeLanguageResponse>;

// Actual function definition, which must receives a union of all possible message types
export async function sendMessage(
  parameters: RequestParameters,
): Promise<MessageResponse> {
  console.log("sending message", parameters);

  if ("tabId" in parameters && parameters.tabId) {
    return await chrome.tabs.sendMessage(parameters.tabId, parameters);
  } else {
    return await chrome.runtime.sendMessage(parameters);
  }
}
