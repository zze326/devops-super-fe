import { Model } from "@/api/ci/ci-pipeline";
import { Model as KubernetesConfig } from "@/api/resource/secret";
type FormDataProps = Partial<Model>;

interface FormProps {
  formData: FormDataProps;
  kubernetesConfigs: KubernetesConfig[];
}

export type { FormDataProps, FormProps };

export enum Permiss {
  READ = "ci-pipeline-read",
  ADD = "ci-pipeline-add",
  UPT = "ci-pipeline-upt",
  DEL = "ci-pipeline-del",
  ARRANGE = "ci-pipeline-arrange",
  RUN = "ci-pipeline-run",
  LOG = "ci-pipeline-run-log"
}
