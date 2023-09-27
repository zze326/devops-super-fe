import { Model } from "@/api/resource/host";
import { Model as HostGroupModel } from "@/api/resource/host-group";
type FormDataProps = Partial<Model>;

type ResetPwdFormDataProps = {
  password: string;
  passwordConfirm: string;
};

interface FormProps {
  formData: FormDataProps;
  hostGroupTreeList: HostGroupModel[];
}

export enum Permiss {
  READ = "host-read",
  ADD = "host-add",
  UPT = "host-upt",
  DEL = "host-del"
}

export type { FormDataProps, ResetPwdFormDataProps, FormProps };
