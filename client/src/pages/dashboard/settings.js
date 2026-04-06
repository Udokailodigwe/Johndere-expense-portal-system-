import { useTheme, themes } from "../../contexts/ThemeContext";
import {
  MdPalette,
  MdLightMode,
  MdDarkMode,
  MdSettings,
  MdComputer,
  MdCheck,
} from "react-icons/md";

const Settings = () => {
  const { currentTheme, changeTheme, getCurrentThemeInfo, systemTheme } =
    useTheme();
  const themeInfo = getCurrentThemeInfo();

  const themeOptions = [
    {
      key: "light",
      icon: MdLightMode,
      title: "Light",
      description: "Clean and bright interface",
      preview: "bg-white border-gray-200",
    },
    {
      key: "dark",
      icon: MdDarkMode,
      title: "Dark",
      description: "Easy on the eyes for low-light environments",
      preview: "bg-gray-900 border-gray-700",
    },
    {
      key: "auto",
      icon: MdComputer,
      title: "Auto",
      description: `Follows your system (currently ${systemTheme})`,
      preview:
        systemTheme === "dark"
          ? "bg-gray-900 border-gray-700"
          : "bg-white border-gray-200",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <MdSettings className="text-2xl text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Customize your experience
            </p>
          </div>
        </div>
      </div>

      {/* Theme Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <MdPalette className="text-xl text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Theme
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose your preferred color scheme
            </p>
          </div>
        </div>

        {/* Current Theme Info */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Current Theme
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {themes[currentTheme].name} - {themes[currentTheme].description}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-lg border-2 ${
                  themeOptions.find((opt) => opt.key === currentTheme)?.preview
                }`}
              ></div>
              {currentTheme === "auto" && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({systemTheme})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Theme Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = currentTheme === option.key;

            return (
              <button
                key={option.key}
                onClick={() => changeTheme(option.key)}
                className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <MdCheck className="text-white text-sm" />
                    </div>
                  </div>
                )}

                <div className="text-left">
                  <div className="flex items-center space-x-3 mb-3">
                    <IconComponent className="text-xl text-gray-600 dark:text-gray-400" />
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {option.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {option.description}
                  </p>

                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-12 h-8 rounded border ${option.preview}`}
                    ></div>
                    <div className="flex space-x-1">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          option.key === "dark"
                            ? "bg-gray-800"
                            : option.key === "light"
                            ? "bg-gray-300"
                            : systemTheme === "dark"
                            ? "bg-gray-800"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          option.key === "dark"
                            ? "bg-gray-600"
                            : option.key === "light"
                            ? "bg-gray-400"
                            : systemTheme === "dark"
                            ? "bg-gray-600"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          option.key === "dark"
                            ? "bg-gray-400"
                            : option.key === "light"
                            ? "bg-gray-500"
                            : systemTheme === "dark"
                            ? "bg-gray-400"
                            : "bg-gray-500"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Theme Preview */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Preview
          </h4>
          <div
            className={`p-4 rounded-lg border ${
              themeInfo.effective === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div
                className={`w-8 h-8 rounded-full ${
                  themeInfo.effective === "dark" ? "bg-blue-600" : "bg-blue-500"
                }`}
              ></div>
              <div>
                <h5
                  className={`font-medium ${
                    themeInfo.effective === "dark"
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                >
                  Sample Card
                </h5>
                <p
                  className={`text-sm ${
                    themeInfo.effective === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  This is how content will look with your selected theme.
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 rounded text-sm font-medium ${
                  themeInfo.effective === "dark"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Button
              </button>
              <button
                className={`px-3 py-1 rounded text-sm font-medium border ${
                  themeInfo.effective === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Secondary
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Settings Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <MdSettings className="text-4xl text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            More Settings Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Additional customization options will be available in future
            updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
