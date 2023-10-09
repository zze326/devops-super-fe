import { Model } from "@/api/resource/kubernetes-config";
type FormDataProps = Partial<Model>;

interface FormProps {
  formData: FormDataProps;
}

export type { FormDataProps, FormProps };

export enum Permiss {
  READ = "kubernetes-config-read",
  ADD = "kubernetes-config-add",
  UPT = "kubernetes-config-upt",
  DEL = "kubernetes-config-del"
}
