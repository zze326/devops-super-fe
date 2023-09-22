import { Model } from "@/api/resource/host-group";
type FormItemProps = Partial<Model>;

interface FormProps {
  formData: FormItemProps;
  list: any;
}

export type { FormItemProps, FormProps };

export enum Permiss {
  READ = "host-group-read",
  ADD = "host-group-add",
  UPT = "host-group-upt",
  DEL = "host-group-del"
}
