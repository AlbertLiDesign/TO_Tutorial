// SPDX-License-Identifier: MIT
// Minimal C ABI over Eigen + CHOLMOD. Upper CSR is interpreted as lower CSC.
#include <Eigen/Sparse>
#include <Eigen/CholmodSupport>
#include <algorithm>
#include <memory>
#ifdef _WIN32
#define EXPORT __declspec(dllexport)
#else
#define EXPORT __attribute__((visibility("default")))
#endif
using Sparse=Eigen::SparseMatrix<double,Eigen::ColMajor,int>;
struct Context {
    Sparse matrix;
    Eigen::CholmodSupernodalLLT<Sparse,Eigen::Lower> factor;
};
extern "C" EXPORT void* beso_create(const int* rows,const int* columns,const double* values,int n,int nnz) {
    try {
        auto ctx=std::make_unique<Context>();
        ctx->matrix=Eigen::Map<const Sparse>(n,n,nnz,rows,columns,values);
        ctx->factor.analyzePattern(ctx->matrix);
        if(ctx->factor.info()!=Eigen::Success || ctx->factor.cholmod().status<CHOLMOD_OK) return nullptr;
        return ctx.release();
    } catch(...) { return nullptr; }
}
extern "C" EXPORT int beso_solve(void* handle,const double* values,const double* rhs,double* output) {
    if(!handle)return 0;
    try {
        auto& ctx=*static_cast<Context*>(handle);
        std::copy(values,values+ctx.matrix.nonZeros(),ctx.matrix.valuePtr());
        ctx.factor.factorize(ctx.matrix);
        if(ctx.factor.info()!=Eigen::Success)return 0;
        Eigen::Map<const Eigen::VectorXd> b(rhs,ctx.matrix.rows());
        Eigen::Map<Eigen::VectorXd> x(output,ctx.matrix.rows());x=ctx.factor.solve(b);
        return ctx.factor.info()==Eigen::Success && x.allFinite()?1:0;
    } catch(...) { return 0; }
}
extern "C" EXPORT void beso_release(void* handle) { delete static_cast<Context*>(handle); }
