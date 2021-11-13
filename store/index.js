import {utils, Contract, providers, constants} from 'ethers'

export const state = () => ({
  hasWallet:false,
  balance:constants.Zero,
  staked: constants.Zero,
  unstaked: constants.Zero,
  rewards: constants.Zero,
  claimed: constants.Zero,
  timeToUnlock: constants.Zero,
  apy: '-',
  time: '-',
  allowance: constants.Zero,
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
  async checkBalance({commit,state}, wallet){
    let provider
    if (state.localStorage.walletVersion == 'metamask') {
      provider = new providers.Web3Provider(this.$eth)
    } else if (state.localStorage.walletVersion == 'walletConnect') {
      provider = new providers.Web3Provider(this.$connector)
    }else if (state.localStorage.walletVersion == 'walletLink'){
      provider = new providers.Web3Provider(this.$walletlink)
    }else{
      provider = null
    }

    if(provider && wallet){
      const token = this.$config.gerContract
      const staking = this.$config.stakingContract
      const tokenAbi = require('../assets/data/abi/IERC20.json')
      const tokenContract = new Contract(token, tokenAbi, provider)

      try {
        const amount = await tokenContract.balanceOf(wallet)
        commit('set',['balance', amount])
        const allowance = await tokenContract.allowance(wallet, staking)
        commit('set',['allowance', allowance])

      } catch (error) {
        console.log(error)
      }
    }else{
      commit('set',['balance',constants.Zero])
      commit('set',['allowance',constants.Zero])
    }
  },
  async getStakingData({commit, state}, wallet){
    let provider
    if (state.localStorage.walletVersion == 'metamask') {
      provider = new providers.Web3Provider(this.$eth)
    } else if (state.localStorage.walletVersion == 'walletConnect') {
      provider = new providers.Web3Provider(this.$connector)
    }else if (state.localStorage.walletVersion == 'walletLink'){
      provider = new providers.Web3Provider(this.$walletlink)
    }else{
      provider = null
    }

    if(provider && wallet){
      const staking = this.$config.stakingContract
      const stakingAbi = require('../assets/data/abi/Staking.json')
      const stakingContract = new Contract(staking, stakingAbi, provider)

      try {
        const amount = await stakingContract.totalRewards(wallet)
        commit('set',['rewards', amount])
        const apy = await stakingContract.apy()
        commit('set',['apy', (parseFloat(utils.formatEther(apy))*100).toFixed(2)])
        const timeLock = await stakingContract.timeLock()
        commit('set',['time', parseInt(timeLock.toString())/86400])
        const claimed = await stakingContract.rewardsPaid(wallet)
        commit('set',['claimed', claimed])
        const myBalance = await stakingContract.balances(wallet)
        commit('set',['staked', myBalance])
        const timeToUnlock = await stakingContract.timeToUnlock(wallet)
        commit('set',['timeToUnlock', timeToUnlock])

      } catch (error) {
        console.log(error)
      }
    }else{
      commit('set',['apy','-'])
      commit('set',['time','-'])
      commit('set',['staked',constants.Zero])
      commit('set',['unstaked',constants.Zero])
      commit('set',['rewards',constants.Zero])
      commit('set',['claimed',constants.Zero])
      commit('set',['timeToUnlock', constants.Zero])
    }
  },
  clearStakingData({commit}){
    commit('set',['apy','-'])
    commit('set',['time','-'])
    commit('set',['staked',constants.Zero])
    commit('set',['unstaked',constants.Zero])
    commit('set',['rewards',constants.Zero])
    commit('set',['claimed',constants.Zero])
    commit('set',['timeToUnlock', constants.Zero])
  },
  clearBalance({commit}){
    commit('set',['balance',constants.Zero])
    commit('set',['allowance',constants.Zero])
  }
}
