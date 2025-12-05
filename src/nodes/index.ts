import KeypairNode from "./Crypto/Keypair";
import GetTokenDetailsNode from "./Explorer/GetTokenDetails";
import GetPriceNode from "./Util/GetPrice";
import ButtonInputNode from "./Input/ButtonInput";
import IntegerInputNode from "./Input/IntegerInput";
import StringInputNode from "./Input/StringInput";
import AddNode from "./Math/AddNode";
import ColorOutputNode from "./Output/ColorOutput";
import TextOutputNode from "./Output/TextOutput";
import SendSOL from "./Web3/SendSOL";
import TransactionNode from "./Web3/Transaction";
import PDANode from "./Crypto/PDA";
import RequestAirdrop from "./Web3/RequestAirdrop";
import SendToken from "./Web3/SendToken";
import SolanaPay from "./Web3/SolanaPay";
import GetTransactionNode from "./Explorer/GetTransaction";
import GetSNS from "./Explorer/GetSNS";
import Mnemonic from "./Crypto/Mnemonic";
import SignMessage from "./Crypto/SignMessage";
import VerifyMessage from "./Crypto/VerifyMessage";
import FileInputNode from "./Input/FileInput";
import GetSOLBalance from "./Explorer/GetSOLBalance";
import GetUserTokens from "./Explorer/GetUserTokenAccounts";
import CreateNFTMetadata from "./Util/CreateNFTMetadata";
import TokenCard from "./Portfolio/TokenCard";
import NFTCard from "./Portfolio/NFTCard";
import WalletBalance from "./Portfolio/WalletBalance";
import Folder from "./Portfolio/Folder";
import ActionResult from "./Portfolio/ActionResult";

export const nodeTypes = {
  stringInput: StringInputNode,
  integerInput: IntegerInputNode,
  buttonInput: ButtonInputNode,
  textOutput: TextOutputNode,
  transaction: TransactionNode,
  colorOutput: ColorOutputNode,
  getTokenDetails: GetTokenDetailsNode,
  sendSOL: SendSOL,
  mnemonic: Mnemonic,
  keypair: KeypairNode,
  requestAirdrop: RequestAirdrop,
  add: AddNode,
  getPrice: GetPriceNode,
  signMessage: SignMessage,
  PDA: PDANode,
  sendToken: SendToken,
  getSns: GetSNS,
  verifyMessage: VerifyMessage,
  getTransaction: GetTransactionNode,
  solanaPay: SolanaPay,
  fileInput: FileInputNode,
  getSOLBalance: GetSOLBalance,
  getUserTokens: GetUserTokens,
  createNftMetadata: CreateNFTMetadata,
  tokenCard: TokenCard,
  nftCard: NFTCard,
  walletBalance: WalletBalance,
  folder: Folder,
  actionResult: ActionResult,
};
