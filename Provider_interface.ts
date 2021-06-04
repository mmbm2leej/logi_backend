export default interface IProvider {
    zip_code: String;
    phone: String;
    phone_ext: String;
    fax: String;
    toll_free: String;
    email: String;
    primary_contact: String;
    time_zone: String;
    hour_start: Number;
    hour_end: Number;
    active: Boolean;
    rate_signed: Boolean;
    primary: Boolean
}