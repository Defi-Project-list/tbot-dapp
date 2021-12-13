<template>
  <div class="section">
    <p class="title is-5">
      Start with TBOT
    </p>
    <div class="is-flex mb-5 is-flex-wrap-wrap">
      <b-button size="is-medium" tag="a" href="https://tbot.fi" class="mr-3 mb-3-mobile" :expanded="!$device.isDesktopOrTablet">
      <div class="is-flex is-align-items-center">
        <img class="mr-2" width="20px" height="20px" src="~/assets/images/tbot.png" alt="Go to tbot.fi">
        Homepage
      </div>
    </b-button>
      <b-button size="is-medium" @click="addToMetamask" v-if="$eth" class="mr-3 mb-3-mobile" :expanded="!$device.isDesktopOrTablet">
      <div class="is-flex is-align-items-center">
        <img class="mr-2" width="20px" height="20px" src="~/assets/images/metamask.png" alt="Add to Metamask">
        Add to Metamask
      </div>
    </b-button>
    <b-button size="is-medium" tag="a" href="https://etherscan.io/token/0xa4f2fdb0a5842d62bbaa5b903f09687b85e4bf59" target="_blank" class="mr-3" :expanded="!$device.isDesktopOrTablet">
      <div class="is-flex is-align-items-center">
        <img class="mr-2" width="20px" height="20px" src="~/assets/images/etherscan-logo.png" alt="View on Etherscan">
        View on Etherscan
      </div>
    </b-button>

    </div>

    <p class="title is-5">
      Information & Statistics
    </p>
    <div class="columns">
        <div class="column">
          <div class="message">
            <div class="message-body">
              <p class="title is-5">
                5,301
              </p>
              <p class="subtitle is-6">
                Holders
              </p>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="message">
            <div class="message-body">
              <p class="title is-5">
                {{tbotPrice}}
              </p>
              <p class="subtitle is-6">
                TBOT ETH Price
              </p>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="message">
            <div class="message-body">
              <p class="title is-5">
                {{ethPrice}}
              </p>
              <p class="subtitle is-6">
                Ethereum USD Price
              </p>
            </div>
          </div>
        </div>
    </div>

    <p class="title is-5">
      Latest Posts
    </p>
    <div class="columns" v-if="loading">
      <div class="column" v-for="post in 3" :key="post">
          <div class="card">
                <div class="card-content">
                    <div class="content">
                        <p class="title is-6"><b-skeleton :active="loading"></b-skeleton></p>
                        <p>
                          <b-skeleton size="is-large" :active="loading"></b-skeleton>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="columns" v-else-if="posts.length == 0">
      <div class="column">
        <p class="has-text-centered">
          Nothing here yet.
        </p>
      </div>
    </div>
      <div class="columns" v-else>
        <div class="column" v-for="post in 3" :key="post">
          <div class="card">
                <div class="card-image">
                    <figure class="image is-5by3">
                        <a :href="posts[post-1].url" target="_blank"><img :src="posts[post-1].feature_image" :alt="posts[post-1].feature_image_alt"></a>
                    </figure>

                </div>
                <div class="card-content">
                    <div class="content">
                        <p class="title is-6"><a :href="posts[post-1].url" target="_blank">{{ posts[post-1].title }}</a></p>
                        <p>
                          {{posts[post-1].custom_excerpt}}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>

  </div>
</template>

<script>
export default {
  data(){
    return {
      loading:false,
      posts:[],
      ethPrice:'-',
      tbotPrice:'-'
      }
  },
  async fetch(){
    this.loading = true
    const {data} = await this.$axios.get(`https://tbot.fi/ghost/api/v4/content/posts/?key=${this.$config.tbotContent}`)
    if(data){
      data.posts.forEach(element => {
        this.posts.push(element)
      })
    }
    const response = await this.$axios.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
      if(response){
        this.ethPrice = response.data.USD.toLocaleString('en-US',{style:'currency',currency:'USD'})
      }else{
        this.ethPrice = 'unavailable'
      }

    const tbotxResponse = await this.$axios.get('https://api.tbotx.io/v2/ticker?symbol=tbot-eth')
    console.log(tbotxResponse)
    if(tbotxResponse){
      this.tbotPrice = tbotxResponse.data.last + ' ETH'
    }else{
      this.tbotPrice = 'unavailable'
    }
    this.loading = false
  },
  methods:{
    async addToMetamask(){
        const tokenAddress = '0xa4f2fdb0a5842d62bbaa5b903f09687b85e4bf59'
        const tokenSymbol = 'TBOT'
        const tokenDecimals = 18
        const tokenImage = 'https://tbot-docs.us-east-1.linodeobjects.com/etherscan-logo.png'

        try {
          // wasAdded is a boolean. Like any RPC method, an error may be thrown.
          const wasAdded = await this.$eth.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20', // Initially only supports ERC20, but eventually more!
              options: {
                address: tokenAddress, // The address that the token is at.
                symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
                decimals: tokenDecimals, // The number of decimals in the token
                image: tokenImage, // A string url of the token logo
              },
            },
          })

          if (wasAdded) {
            this.$buefy.notification.open({
                    message: `Great! TBOT added`,
                    duration: 10000,
                    progressBar: true,
                    closable: false,
                    hasIcon:true,
                    type: 'is-success',
                    pauseOnHover: true
                })
          } else {
            this.$buefy.notification.open({
                    message: `Something went wrong adding the token`,
                    duration: 10000,
                    progressBar: true,
                    closable: false,
                    hasIcon:true,
                    type: 'is-danger',
                    pauseOnHover: true
                })
          }
        } catch (error) {
          console.log(error)
        }
      }
  }

}
</script>
