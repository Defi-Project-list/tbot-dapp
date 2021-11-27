import WalletConnectProvider from "@walletconnect/web3-provider"
import detectEthereumProvider from '@metamask/detect-provider'
import WalletLink from "walletlink"

export default async ({ $config }, inject) => {

  const WalletConnectConnector = new WalletConnectProvider({
    infuraId: $config.infuraId
  })

  const walletLink = new WalletLink({
    appName: 'TBOT Project',
    appLogoUrl: 'https://tbot-docs.us-east-1.linodeobjects.com/tbot.png',
    darkMode: false
  })

  const walletLinkProvider = walletLink.makeWeb3Provider(
    `https://mainnet.infura.io/v3/${$config.infuraId}`, 1
  )

  const ethereum = await detectEthereumProvider()

  inject('connector', WalletConnectConnector)
  inject('walletlink', walletLinkProvider)
  if (ethereum) inject('eth', ethereum)
}
