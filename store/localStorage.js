export const state = () => ({
  walletVersion:null,
  selectedAccount: 0,
  accounts: [],
  chainId: null
})

export const mutations = {
  set(state, [variable, value]) {
    state[variable] = value
  }
}