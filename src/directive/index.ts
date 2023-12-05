import { type App, type Directive, type DirectiveBinding } from 'vue'

const ellipsis: Directive = {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        const rowNum: number = Number(binding.value)
        el.style.overflow = 'hidden'
        if (rowNum) {
            el.style.display = '-webkit-box'
            el.style.webkitLineClamp = String(rowNum)
            el.style.webkitBoxOrient = 'vertical'
            if (el.clientHeight < el.scrollHeight) {
                el.title = el.innerText
            }
        } else {
            el.style.textOverflow = 'ellipsis'
            el.style.whiteSpace = 'nowrap'
            if (el.clientWidth < el.scrollWidth) {
                el.title = el.innerText
            }
        }

    }
}

export default function (app: App<Element>) {
    app.directive('ellipsis', ellipsis)
}