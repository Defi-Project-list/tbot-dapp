import { extend } from "vee-validate"
import { required, min, email, numeric } from "vee-validate/dist/rules"

extend("required", {...required})
extend("min", {...min})
extend("email", {...email})
extend("numeric", {...numeric})