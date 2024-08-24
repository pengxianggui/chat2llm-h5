import { defineStore } from "pinia";
import { ref } from "vue";
import { getKbs } from '@/api/knowledge';
import { Knowledge } from '@/views/chat2llm/model'

export const useKnowledgeStore = defineStore('knowledges', () => {
    const knowledges = ref([] as Knowledge[])

    function get(kb_id?: string) {
        if (!kb_id) {
            return null;
        }
        return knowledges.value.find(kb => kb.kb_id === kb_id)
    }

    function initKbs() {
        return new Promise<Array<Knowledge>>((resolve, reject) => {
            getKbs().then(({ data }) => {
                knowledges.value = data;
                resolve(knowledges.value)
            }).catch(err => {
                reject(err)
            })
        })
    }

    function isEmpty() {
        return knowledges.value.length == 0
    }

    return { get, knowledges, initKbs, isEmpty }
})
