import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { FormItemProps, ETypeModel, EType } from "./types";
import { type OptionsType } from "@/components/ReSegmented";
import {
  noChineseIgnoreMidLineAndBottomLineRule,
  requiredRule
} from "@/utils/formRules";

export const dynamicRules = (
  formData: FormItemProps,
  list: FormItemProps[]
) => {
  let parent = null;
  if (formData && list) {
    parent = list.find(item => item.id === formData.parentId);
  }

  const rules = <FormRules>{
    title: [requiredRule("权限标题为必填项")],
    type: [requiredRule("权限类型为必填项")],
    name: [
      requiredRule("权限名称为必填项"),
      noChineseIgnoreMidLineAndBottomLineRule(
        "权限名称不能包含中文和特殊字符（-、_除外）"
      )
    ],
    bRoutes: [
      {
        validator: (rule, value, callback) => {
          const regex = /^(get|post|put|delete|patch):\/[a-zA-Z0-9_\-/:]+$/;
          const invalidRoutes = value.filter(route => !regex.test(route));

          if (invalidRoutes.length > 0) {
            callback(new Error("后端路由格式错误"));
          } else {
            callback();
          }
        },
        trigger: "change"
      }
    ],
    rank: [requiredRule("排序为必填项")]
  };

  switch (formData.type) {
    case EType.DIR:
      Object.assign(rules, {
        fRoute: [requiredRule("前端路由为必填项")],
        redirect: [requiredRule("重定向路径为必填项")],
        icon: [requiredRule("图标为必填项")],
        showLink: [requiredRule("显示在菜单为必填项")],
        parentId: [
          {
            validator: (rule, value, callback) => {
              if (parent && parent.type !== EType.DIR) {
                callback(new Error("目录类型权限的上级权限只能是目录类型"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ]
      });
      break;
    case EType.MENU:
      Object.assign(rules, {
        fRoute: [requiredRule("前端路由为必填项")],
        showLink: [requiredRule("显示在菜单为必填项")],
        showParent: [requiredRule("显示父菜单为必填项")],
        keepAlive: [requiredRule("是否开启页面缓存为必填项")],
        parentId: [
          {
            validator: (rule, value, callback) => {
              if (parent && parent.type !== EType.DIR) {
                callback(new Error("菜单类型权限的上级权限只能是目录类型"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ]
      });
      break;
    case EType.ABLE:
      Object.assign(rules, {
        parentId: [
          requiredRule("上级权限为必填项"),
          {
            validator: (rule, value, callback) => {
              if (parent && parent.type !== EType.MENU) {
                callback(new Error("功能类型权限的上级权限只能是菜单类型"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ]
      });
      break;
  }
  return reactive(rules);
};

export const initValues = (row?: FormItemProps): FormItemProps => {
  return {
    parentId: row?.parentId ?? 0,
    fRoute: row?.fRoute ?? "",
    bRoutes: row?.bRoutes ?? [],
    type: row?.type ?? 1,
    name: row?.name ?? "",
    redirect: row?.redirect ?? "",
    title: row?.title ?? "",
    icon: row?.icon ?? "",
    rank: row?.rank ?? 0,
    showLink: row?.showLink ?? false,
    showParent: row?.showParent ?? false,
    keepAlive: row?.keepAlive ?? false
  };
};

export const typeOptions: Array<OptionsType> = [
  {
    label: ETypeModel.displayOf(EType.DIR),
    value: EType.DIR
  },
  {
    label: ETypeModel.displayOf(EType.MENU),
    value: EType.MENU
  },
  {
    label: ETypeModel.displayOf(EType.ABLE),
    value: EType.ABLE
  }
];
