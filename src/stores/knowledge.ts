import { defineStore } from "pinia";
import { ref } from "vue";
import { getKbs } from '@/api/knowledge';

export const useKnowledgeStore = defineStore('knowledges', () => {
    const knowledges = ref([] as Array<{ kb_name: string, kb_zh_name: string, kb_info: string, create_time: string }>)

    function get(kb_name: string) {
        if (knowledges.value.length == 0) {
            initKbs();
        }
        return knowledges.value.find(kb => kb.kb_name === kb_name);
    }

    function initKbs() {
        return new Promise<Array<{ kb_name: string, kb_zh_name: string, kb_info: string, create_time: string }>>((resolve, reject) => {
            getKbs().then(({ data }) => {
                knowledges.value = data;
                resolve(knowledges.value)
            }).catch(err => {
                reject(err)
            })
        })
    }

    return { get, knowledges, initKbs }
})
