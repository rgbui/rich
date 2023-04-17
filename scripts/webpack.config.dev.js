const path = require("path");
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');


const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * webpack url https://www.cnblogs.com/brandonhulala/p/6057378.html
 * 
 */

let port = 6667;
let publicPath = `http://127.0.0.1:${port}/`;

module.exports = {
    mode: 'development',
    entry:{test: "./test/index.tsx"},
    devtool: 'eval-source-map',
    output: {
        path: path.join(__dirname, "../dist"),
        filename: "assert/js/shy.[name].[contenthash:8].js",
        chunkFilename: 'assert/js/shy.[name].[contenthash:8].js',
        publicPath
    },
    resolve: {
        extensions: ['.tsx', ".ts", ".js", ".less", ".css"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ["ts-loader"]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.less$/,
                use:
                    [
                        'style-loader',
                        'css-loader',
                        'less-loader',
                        // {
                        //     loader: 'sass-resources-loader',
                        //     options: {
                        //         resources: [
                        //             path.resolve(__dirname, "../src/assert/less.less")
                        //         ]
                        //     }
                        // }
                    ],
            },
            {
                test: /\.svg$/,
                issuer: /\.[jt]sx?$/,
                use: [
                    { loader: '@svgr/webpack' },
                ]
            },
            {
                test: /\.svg$/,
                issuer: /\.(css|less|styl)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assert/img/[name]-[contenthash:8][ext]',
                }
            },
            {
                test: /\.(jpe?g|png|gif|bmp|webp)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assert/img/[name]-[contenthash:8][ext]',
                },
                // 是parser，不是parse
                parser: {
                    dataUrlCondition: {
                        // 是maxSize，不再是limit
                        maxSize: 5 * 1024
                    }
                }
            },
            {
                test: /\.(json|md)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'data/[name]-[contenthash:8][ext]',
                }
            },
            {
                test: /\.(woff2?|eot|ttf)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assert/font/[name]-[contenthash:8][ext]'
                },
                // 是parser，不是parse
                parser: {
                    dataUrlCondition: {
                        // 是maxSize，不再是limit
                        maxSize: 5 * 1024
                    }
                }
            }
        ]
    },
    externals: {

    },
    plugins: [
        // new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "index.html"), // 婧愭ā鏉挎枃浠�
            filename: 'index.html', //
            showErrors: true,
            chunks: ['test', 'shared'],
            hash: true
        }),
        new webpack.DefinePlugin({
            MODE: JSON.stringify('dev')
        }),
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/g,
        }),
        new MiniCssExtractPlugin({
            filename: "assert/css/shy.[contenthash:8].css"
        }),
        new CopyWebpackPlugin(
            {
                patterns: [
                    { from: path.join(__dirname, "../extensions/emoji/emoji.json"), to: "data/emoji.json" },
                    { from: path.join(__dirname, "../extensions/font-awesome/font-awesome.json"), to: "data/font-awesome.json" }
                ]
            }
        ),
    ],
    optimization: {
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
            // async：异步导入， initial：同步导入， all：异步/同步导入
            chunks: "all",
            // 最小尺寸: 单位是字节，如果拆分出来一个, 那么拆分出来的这个包的大小最小为minSize
            minSize: 250000,
            // 将大于maxSize的包, 拆分成不小于minSize的包
            maxSize: 250000,
            // minChunks表示引入的包, 至少被导入了几次 【才拆分】
            minChunks: 1,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    filename: "assert/js/shy.[id].[contenthash:8].js",
                    chunks: 'all',
                },
                default: {
                    // 如果一个文件被引入了2次，就单独打包出来一个js文件
                    minChunks: 2,
                    filename: "assert/js/shy.common.[id].[contenthash:8].js",
                    priority: -20
                }
            },
        },
    },
    devServer: {
        static: {
            directory: path.join(__dirname, '../dist'),
        },
        client: {
            progress: true,
        },
        host: '127.0.0.1',
        compress: true,
        port: port,
        open: true,
        historyApiFallback: {
            rewrites: [
                { from: /^[a-zA-Z\d\/]+$/, to: '/index.html' }
            ]
        }
    },
};