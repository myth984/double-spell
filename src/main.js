import Vue from 'vue';
import Antd from 'ant-design-vue';
import App from './App';
import 'ant-design-vue/dist/antd.css';
import axios from "axios"
Vue.config.productionTip = false;

Vue.use(Antd);
Vue.prototype.$axios = axios
Vue.config.productionTip = false

new Vue({
    render: h => h(App),
}).$mount('#app')