
export class User {
    client_id: string;
    user_id: string;
    username: string;
    enable: boolean;

    constructor(client_id: string, user_id: string, username: string, enable: boolean) {
        this.client_id = client_id
        this.user_id = user_id
        this.username = username
        this.enable = enable
    }
}