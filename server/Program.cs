using System.Collections.Concurrent;
using System.Text.Json;
if(args.Contains("--teaching-examples")){TeachingExamples.Run();return;}
if(args.Contains("--verify-methods")){MethodVerification.Run();return;}
if(args.Contains("--verify-elements")){Tutorial.Fem.ElementVerification.Run();return;}
if(args.Contains("--verify-spatial")){SpatialVerification.Run();return;}
if(args.Contains("--verify-legacy")){LegacyParity.Run();return;}
if(args.Contains("--verify")){Verification.Run();return;}
var builder=WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls(Environment.GetEnvironmentVariable("TOPTEACH_URLS")??"http://127.0.0.1:5080");
var app=builder.Build();
var runs=new ConcurrentDictionary<string,Run>(); var queue=new SemaphoreSlim(1,1); var admission=new object();
app.Use(async(ctx,next)=>{
    ctx.Response.Headers["X-Content-Type-Options"]="nosniff";
    if(ctx.Request.Path.StartsWithSegments("/api")&&ctx.Request.Method=="POST"&&ctx.Request.Headers.TryGetValue("Origin",out var origin)&&Uri.TryCreate(origin,UriKind.Absolute,out var uri)&&uri.Authority!=ctx.Request.Host.Value){ctx.Response.StatusCode=403;return;}
    await next();
});
app.UseDefaultFiles();app.UseStaticFiles();
app.MapGet("/api/health",()=>Results.Ok(new{engine="Top Lab Q4/H8",objective="compliance",frameState="post-update",schemaVersion=2,methods=new[]{"BESO","SIMP","ESO","level-set"},solver="Eigen CHOLMOD",assembly="serial",status="ready"}));
app.MapPost("/api/runs",(Settings s)=>{
    try{s.Validate();}catch(ArgumentException e){return Results.BadRequest(new{error=e.Message});}
    lock(admission){
        foreach(var kv in runs.Where(kv=>DateTime.UtcNow-kv.Value.Touched>TimeSpan.FromMinutes(30)).ToArray()){kv.Value.Dispose();runs.TryRemove(kv.Key,out _);}
        if(runs.Values.Count(r=>r.State is "queued" or "running" or "initializing" or "paused")>=3)return Results.Json(new{error="计算队列已满，请先停止已有任务。"},statusCode:429);
        if(runs.Count>=12){var oldest=runs.Where(kv=>kv.Value.State is "limit" or "converged" or "cancelled" or "error").OrderBy(kv=>kv.Value.Touched).FirstOrDefault();if(oldest.Key!=null)runs.TryRemove(oldest.Key,out _);}
        var run=new Run(s);runs[run.Id]=run;_ = Task.Run(()=>run.Execute(queue));return Results.Ok(new{id=run.Id});
    }
});
app.MapGet("/api/runs/{id}",(string id,int? after)=>{
    if(!runs.TryGetValue(id,out var run))return Results.NotFound();
    lock(run.Gate){run.Touched=DateTime.UtcNow;return Results.Ok(new{run.Id,run.State,run.Error,run.Settings,frames=run.Frames.Where(f=>f.Iter>(after??0)).Take(5).ToArray(),count=run.Frames.Count});}
});
app.MapPost("/api/runs/{id}/{action}",(string id,string action)=>{
    if(!runs.TryGetValue(id,out var r))return Results.NotFound();
    lock(r.Gate){r.Touched=DateTime.UtcNow; switch(action){case "pause":r.Pause=true;break;case "resume":r.Pause=false;break;case "step":r.Pause=true;r.Steps++;break;case "stop":r.Cancel=true;break;default:return Results.BadRequest();}return Results.Ok();}
});
app.MapGet("/api/provenance",()=>Results.File(Path.Combine(app.Environment.ContentRootPath,"provenance.json"),"application/json"));
app.Lifetime.ApplicationStopping.Register(()=>{foreach(var r in runs.Values)r.Dispose();});
app.Run();
