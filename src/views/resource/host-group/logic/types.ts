import { Model } from "@/api/resource/host-group";
import { Model as UserModel } from "@/api/system/user";
import { Model as RoleModel } from "@/api/system/role";
type FormItemProps = Partial<Model>;

interface FormProps {
  formData: FormItemProps;
  list: any;
  roleList: RoleModel[];
  userList: UserModel[];
}

export type { FormItemProps, FormProps };

export enum Permiss {
  READ = "host-group-read",
  ADD = "host-group-add",
  UPT = "host-group-upt",
  DEL = "host-group-del"
}
