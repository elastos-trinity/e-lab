import { AfterViewInit, Component } from "@angular/core";
import anime from "animejs";

@Component({
  selector: 'app-elab-loader',
  templateUrl: './elab-loader.component.html',
  styleUrls: ['./elab-loader.component.scss']
})
export class ElabLoaderComponent implements AfterViewInit {
  ngAfterViewInit() {
    anime({
      targets: '#elab-loader path',
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInBounce',
      duration: 10_000,
      loop: true,
      begin: function(anim) {
        const elabLoaderPath = document.querySelector('#elab-loader path');
        if (elabLoaderPath)
          elabLoaderPath.setAttribute("stroke", "url(#stroke-gradient-loader)");
        if (elabLoaderPath)
          elabLoaderPath.setAttribute("fill", "url(#fill-gradient-loader)");
      },
    });
  }

}
