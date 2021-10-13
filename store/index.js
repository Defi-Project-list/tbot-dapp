export const state = () => ({
  hasWallet:false,
  provider:null,
  availableChains: [{
      hex: '0x1',
      decimal: 1,
      name: 'Ethereum Main Network (Mainnet)'
    },
    {
      hex: '0x3',
      decimal: 3,
      name: 'Ropsten Test Network'
    },
    {
      hex: '0x4',
      decimal: 4,
      name: 'Rinkeby Test Network'
    },
    {
      hex: '0x5',
      decimal: 5,
      name: 'Goerli Test Network'
    },
    {
      hex: '0x2a',
      decimal: 42,
      name: 'Kovan Test Network'
    }
  ],
  transactions:[]
})

export const mutations = {
  set(state, [variable, value]) {
    state[variable] = value
  }
}

export const actions = {

}
