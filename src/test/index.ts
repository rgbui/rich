

import "./util/array";
import Vue from 'vue';

Vue.config.silent = true;
// 可以使用 `v-on:keyup.f1`
Vue.config.keyCodes.backspace = 8;
Vue.config.keyCodes.del = 46;
Vue.config.keyCodes.space = 32;
Vue.config.keyCodes.esc = 27;

import App from './app.vue';
import VueRouter from "vue-router";

// 要告诉 vue 使用 vueRouter
Vue.use(VueRouter);

var routes = [];
routes.push({
    name: 'editor',
    path: '/editor',
    component: () => import('./editor.vue')
})
var router = new VueRouter({
    mode: 'history',
    routes
})
new Vue({
    el: document.body.appendChild(document.createElement('div')),
    router,  // 注入到根实例中
    render: h => h(App, { ref: 'app' })
    
});