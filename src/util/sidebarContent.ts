import { SidebarContentType } from '@/types/sidebar';

export const sidebarContent: SidebarContentType[] = [
  {
    title: "Input",
    icon: "/icons/Input.svg",
    items: [
      {
        title: "String Input",
        type: "stringInput",
      },
      {
        title: "Integer Input",
        type: "integerInput",
      },
      {
        title: "Button",
        type: "buttonInput",
      },
      {
        title: "File Input",
        type: "fileInput",
      },
    ],
  },
  {
    title: "Output",
    icon: "/icons/Output.svg",
    items: [
      {
        title: "Text Output",
        type: "textOutput",
      },
      {
        title: "Color Output",
        type: "colorOutput",
      },
    ],
  },
  {
    title: "Crypto",
    icon: "/icons/Crypto.svg",
    items: [
      {
        title: "Keypair",
        type: "keypair",
      },
      {
        title: "PDA",
        type: "PDA",
      },
      {
        title: "Mnemonic/Seed",
        type: "mnemonic",
      },
      {
        title: "Sign Message",
        type: "signMessage",
      },
      {
        title: "Verify Message",
        type: "verifyMessage",
      },
    ],
  },
  // {
  //   title: "Math",
  //   icon: "/icons/Math.svg",
  //   items: [
  //     {
  //       title: "Add",
  //       type: "add",
  //     },
  //   ],
  // },
  {
    title: "Explorer",
    icon: "/icons/Explorer.svg",
    items: [
      {
        title: "Get Transaction",
        type: "getTransaction",
      },
      {
        title: "Get Token Details",
        type: "getTokenDetails",
      },
      {
        title: "Get SNS Domain",
        type: "getSns",
      },
      {
        title: "Get SOL Balance",
        type: "getSOLBalance",
      },
      {
        title: "Get User Tokens",
        type: "getUserTokens",
      },
    ],
  },
  {
    title: "Web3",
    icon: "/icons/Web3.svg",
    items: [
      {
        title: "Transaction",
        type: "transaction",
      },
      {
        title: "Airdrop",
        type: "requestAirdrop",
      },
      {
        title: "Send SOL",
        type: "sendSOL",
      },
      {
        title: "Send Token",
        type: "sendToken",
      },
      {
        title: "Solana Pay",
        type: "solanaPay",
      },
    ],
  },
  {
    title: "Utility",
    icon: "/icons/Util.svg",
    items: [
      {
        title: "Get Price",
        type: "getPrice",
      },
      {
        title: "Create NFT Metadata",
        type: "createNftMetadata",
      },
    ],
  },
];
