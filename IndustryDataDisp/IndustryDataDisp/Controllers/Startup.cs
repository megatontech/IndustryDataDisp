using System;
using System.Threading.Tasks;
using Microsoft.Owin;
using Owin;
using Microsoft.AspNet.SignalR;
[assembly: OwinStartup(typeof(IndustryDataDisp.Controllers.Startup), "Configuration")]

namespace IndustryDataDisp.Controllers
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // 有关如何配置应用程序的详细信息，请访问 http://go.microsoft.com/fwlink/?LinkID=316888
            Startup.ConfigureSignalR(app);
            GlobalHost.Configuration.ConnectionTimeout = TimeSpan.FromSeconds(50);
            GlobalHost.Configuration.DisconnectTimeout = TimeSpan.FromSeconds(7200);
        }
        public static void ConfigureSignalR(IAppBuilder app)
        {
            app.MapSignalR();
        }
    }
}