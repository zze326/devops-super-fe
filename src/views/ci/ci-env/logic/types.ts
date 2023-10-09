import { Model } from "@/api/ci/ci-env";
type FormDataProps = Partial<Model>;

interface FormProps {
  formData: FormDataProps;
}

export type { FormDataProps, FormProps };

export enum Permiss {
  READ = "ci-env-read",
  ADD = "ci-env-add",
  UPT = "ci-env-upt",
  DEL = "ci-env-del"
}
