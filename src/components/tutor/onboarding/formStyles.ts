export const inputClass =
  "border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 w-full";
export const labelClass = "font-label-md text-label-md text-on-surface-variant";
export const errorTextClass = "font-body-sm text-body-sm text-error mt-1";
export const fieldWrapClass = "flex flex-col gap-2";
// A bare <input type="file"> renders as a tiny, unstyled native button
// that's easy to miss next to this app's custom-styled buttons — the
// file: variant targets the browser's ::file-selector-button so it
// matches the rest of the design system instead of looking broken.
export const fileInputClass =
  "font-body-sm text-body-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-label-md file:text-label-md file:bg-primary-container file:text-on-primary hover:file:shadow-md file:transition-all file:cursor-pointer cursor-pointer";
