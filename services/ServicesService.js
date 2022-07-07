import { transaction } from "objection";
import { Services } from "./../lib/models/Services";
import { Services_rooms } from "./../lib/models/Services_rooms";

export default class ServicesService {

  static async deactivateService(ctx, id) {
    await Services.query().patchAndFetchById(id, {
      active: false
    })
  }

  static async deactivateServicesRooms(ctx, id) {
    await Services_rooms.query().patchAndFetchById(id, {
      active: false
    })
  }

}