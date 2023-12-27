/**
 * 推荐问题
 */
export class RecommendQustion {
    // 问题内容
    query: string = '';
    // 知识库
    kb_name?: string;

    constructor(query: string, knowledgeName ?: string) {
        this.query = query
        this.kb_name = knowledgeName
    }
}