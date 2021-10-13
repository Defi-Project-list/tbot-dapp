import { ToastProgrammatic as Toast } from 'buefy'

export default function ({ $axios, redirect }) {
  $axios.onRequest(config => {
    console.log(`Making request to  ${config.url}`)
  })

  $axios.onError(error => {
    // Toast.open({
    //   duration: 5000,
    //   message: `Error ${error.response.status} - ${error.response.statusText}`,
    //   position: 'is-bottom',
    //   type: 'is-danger'
    // })
    console.log(`Error ${error.response.status} - ${error.response.statusText}`)
    return Promise.resolve(false)
  })
}